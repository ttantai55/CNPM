package vn.doan.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import vn.doan.domain.enums.UnitType;

public class IngredientCreateRequest {

    @NotBlank(message = "Tên nguyên liệu không được để trống")
    private String name;

    @NotNull(message = "Đơn vị tính không được để trống")
    private UnitType unit;

    @Min(value = 0, message = "Số lượng tồn kho không được âm")
    private int currentStock;

    @Min(value = 0, message = "Ngưỡng cảnh báo không được âm")
    private double minAlertThreshold;

    public IngredientCreateRequest() {}

    public IngredientCreateRequest(String name, UnitType unit, int currentStock, double minAlertThreshold) {
        this.name = name;
        this.unit = unit;
        this.currentStock = currentStock;
        this.minAlertThreshold = minAlertThreshold;
    }

    // Getters & Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public UnitType getUnit() { return unit; }
    public void setUnit(UnitType unit) { this.unit = unit; }
    public int getCurrentStock() { return currentStock; }
    public void setCurrentStock(int currentStock) { this.currentStock = currentStock; }
    public double getMinAlertThreshold() { return minAlertThreshold; }
    public void setMinAlertThreshold(double minAlertThreshold) { this.minAlertThreshold = minAlertThreshold; }
}