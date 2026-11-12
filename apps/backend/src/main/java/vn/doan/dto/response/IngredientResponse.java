package vn.doan.dto.response;

import vn.doan.domain.enums.UnitType;

public class IngredientResponse {
    private String id;
    private String name;
    private UnitType unit;
    private int currentStock;
    private double minAlertThreshold;
    private boolean isBelowThreshold; // Trả thêm trường này để FE dễ hiện cảnh báo đỏ

    public IngredientResponse() {}

    public IngredientResponse(String id, String name, UnitType unit, int currentStock, double minAlertThreshold, boolean isBelowThreshold) {
        this.id = id;
        this.name = name;
        this.unit = unit;
        this.currentStock = currentStock;
        this.minAlertThreshold = minAlertThreshold;
        this.isBelowThreshold = isBelowThreshold;
    }

    // Getters & Setters
    public String getId() { return id; }

    public String getName() { return name; }

    public UnitType getUnit() { return unit; }

    public int getCurrentStock() { return currentStock; }

    public double getMinAlertThreshold() { return minAlertThreshold; }

    public boolean isBelowThreshold() { return isBelowThreshold; }

}