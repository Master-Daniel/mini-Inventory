package main

import (
	"testing"
)

func TestCalculateSummaryMetrics(t *testing.T) {
	products := []ProductData{
		{ID: "p1", Name: "Laptop", SKU: "SKU-1", Stock: 5, Price: 999.99},
		{ID: "p2", Name: "Mouse", SKU: "SKU-2", Stock: 50, Price: 25.00},
	}

	orders := []OrderData{
		{
			ID:          "o1",
			TotalAmount: 1024.99,
			Items: []OrderItemData{
				{ProductID: "p1", ProductName: "Laptop", Quantity: 1, UnitPrice: 999.99},
				{ProductID: "p2", ProductName: "Mouse", Quantity: 1, UnitPrice: 25.00},
			},
		},
		{
			ID:          "o2",
			TotalAmount: 50.00,
			Items: []OrderItemData{
				{ProductID: "p2", ProductName: "Mouse", Quantity: 2, UnitPrice: 25.00},
			},
		},
	}

	report := CalculateSummaryMetrics(orders, products)

	if report.TotalOrders != 2 {
		t.Errorf("Expected 2 total orders, got %d", report.TotalOrders)
	}

	expectedRev := 1074.99
	if report.TotalRevenue != expectedRev {
		t.Errorf("Expected total revenue %.2f, got %.2f", expectedRev, report.TotalRevenue)
	}

	if len(report.LowStockProducts) != 1 || report.LowStockProducts[0].ID != "p1" {
		t.Errorf("Expected 1 low stock product (p1), got %v", report.LowStockProducts)
	}

	if len(report.TopSellingProducts) != 2 {
		t.Errorf("Expected 2 top selling products, got %d", len(report.TopSellingProducts))
	}
}
