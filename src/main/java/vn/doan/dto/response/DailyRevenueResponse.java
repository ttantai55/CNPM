package vn.doan.dto.response;

import java.time.LocalDate;

public class DailyRevenueResponse {
    private LocalDate date;
    private int totalOrders; // Tổng số hóa đơn
    private long totalRevenue; // Tổng doanh thu (VND)

    public DailyRevenueResponse() {}

    public DailyRevenueResponse(LocalDate date, int totalOrders, long totalRevenue) {
        this.date = date;
        this.totalOrders = totalOrders;
        this.totalRevenue = totalRevenue;
    }

    // Getters & Setters
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public int getTotalOrders() { return totalOrders; }
    public void setTotalOrders(int totalOrders) { this.totalOrders = totalOrders; }
    public long getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(long totalRevenue) { this.totalRevenue = totalRevenue; }
}