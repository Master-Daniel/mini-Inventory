package main

import (
	"encoding/json"
	"net/http"
	"strconv"
)

type ProductStat struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	SKU   string  `json:"sku"`
	Stock int     `json:"stock"`
	Price float64 `json:"price"`
}

type TopSellingProduct struct {
	ProductID string  `json:"productId"`
	Name      string  `json:"name"`
	TotalQty  int     `json:"totalQuantitySold"`
	TotalRev  float64 `json:"totalRevenue"`
}

type SummaryReport struct {
	TotalRevenue       float64             `json:"totalRevenue"`
	TotalOrders        int                 `json:"totalOrders"`
	AverageOrderValue  float64             `json:"averageOrderValue"`
	LowStockProducts   []ProductStat       `json:"lowStockProducts"`
	TopSellingProducts []TopSellingProduct `json:"topSellingProducts"`
}

func CalculateSummaryMetrics(orders []OrderData, products []ProductData) SummaryReport {
	var totalRev float64
	totalOrders := len(orders)
	productSales := make(map[string]*TopSellingProduct)

	for _, order := range orders {
		totalRev += order.TotalAmount
		for _, item := range order.Items {
			if _, exists := productSales[item.ProductID]; !exists {
				productSales[item.ProductID] = &TopSellingProduct{
					ProductID: item.ProductID,
					Name:      item.ProductName,
				}
			}
			productSales[item.ProductID].TotalQty += item.Quantity
			productSales[item.ProductID].TotalRev += float64(item.Quantity) * item.UnitPrice
		}
	}

	var avgOrderValue float64
	if totalOrders > 0 {
		avgOrderValue = totalRev / float64(totalOrders)
	}

	var lowStock []ProductStat
	for _, p := range products {
		if p.Stock <= 10 {
			lowStock = append(lowStock, ProductStat{
				ID:    p.ID,
				Name:  p.Name,
				SKU:   p.SKU,
				Stock: p.Stock,
				Price: p.Price,
			})
		}
	}

	var topSelling []TopSellingProduct
	for _, stat := range productSales {
		topSelling = append(topSelling, *stat)
	}

	return SummaryReport{
		TotalRevenue:       totalRev,
		TotalOrders:        totalOrders,
		AverageOrderValue:  avgOrderValue,
		LowStockProducts:   lowStock,
		TopSellingProducts: topSelling,
	}
}

type OrderItemData struct {
	ProductID   string  `json:"productId"`
	ProductName string  `json:"productName"`
	Quantity    int     `json:"quantity"`
	UnitPrice   float64 `json:"unitPrice"`
}

type OrderData struct {
	ID          string          `json:"id"`
	TotalAmount float64         `json:"totalAmount"`
	Items       []OrderItemData `json:"items"`
}

type ProductData struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	SKU   string  `json:"sku"`
	Stock int     `json:"stock"`
	Price float64 `json:"price"`
}

type NestProduct struct {
	ID          string      `json:"id"`
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Price       interface{} `json:"price"`
	Stock       int         `json:"stock"`
	SKU         string      `json:"sku"`
}

func parsePrice(val interface{}) float64 {
	switch v := val.(type) {
	case float64:
		return v
	case string:
		f, _ := strconv.ParseFloat(v, 64)
		return f
	default:
		return 0.0
	}
}

func enableCORS(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

func summaryHandler(backendURL string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		enableCORS(&w)
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		respProducts, err := http.Get(backendURL + "/products")
		if err != nil {
			http.Error(w, "Failed to fetch products from backend: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer respProducts.Body.Close()

		var rawProducts []NestProduct
		if err := json.NewDecoder(respProducts.Body).Decode(&rawProducts); err != nil {
			http.Error(w, "Failed to decode products: "+err.Error(), http.StatusInternalServerError)
			return
		}

		var products []ProductData
		for _, rp := range rawProducts {
			products = append(products, ProductData{
				ID:    rp.ID,
				Name:  rp.Name,
				SKU:   rp.SKU,
				Stock: rp.Stock,
				Price: parsePrice(rp.Price),
			})
		}

		reqOrders, err := http.NewRequest("GET", backendURL+"/orders", nil)
		if err != nil {
			http.Error(w, "Failed to build orders request: "+err.Error(), http.StatusInternalServerError)
			return
		}
		if authHeader := r.Header.Get("Authorization"); authHeader != "" {
			reqOrders.Header.Set("Authorization", authHeader)
		}

		client := &http.Client{}
		respOrders, err := client.Do(reqOrders)
		if err != nil || respOrders.StatusCode != http.StatusOK {
			summary := CalculateSummaryMetrics([]OrderData{}, products)
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(summary)
			return
		}
		defer respOrders.Body.Close()

		type NestOrderItem struct {
			Quantity  int         `json:"quantity"`
			UnitPrice interface{} `json:"unitPrice"`
			Product   struct {
				ID   string `json:"id"`
				Name string `json:"name"`
			} `json:"product"`
		}

		type NestOrder struct {
			ID          string          `json:"id"`
			TotalAmount interface{}     `json:"totalAmount"`
			Items       []NestOrderItem `json:"items"`
		}

		var rawOrders []NestOrder
		if err := json.NewDecoder(respOrders.Body).Decode(&rawOrders); err != nil {
			summary := CalculateSummaryMetrics([]OrderData{}, products)
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(summary)
			return
		}

		var orders []OrderData
		for _, ro := range rawOrders {
			totalAmt := parsePrice(ro.TotalAmount)
			var items []OrderItemData
			for _, item := range ro.Items {
				uPrice := parsePrice(item.UnitPrice)
				pName := ""
				pID := ""
				if item.Product.ID != "" {
					pID = item.Product.ID
					pName = item.Product.Name
				}
				items = append(items, OrderItemData{
					ProductID:   pID,
					ProductName: pName,
					Quantity:    item.Quantity,
					UnitPrice:   uPrice,
				})
			}

			orders = append(orders, OrderData{
				ID:          ro.ID,
				TotalAmount: totalAmt,
				Items:       items,
			})
		}

		summary := CalculateSummaryMetrics(orders, products)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(summary)
	}
}

func main() {
	backendURL := "http://localhost:3000"
	http.HandleFunc("/reports/summary", summaryHandler(backendURL))
	println("Golang Analytics Microservice running on http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		panic(err)
	}
}
