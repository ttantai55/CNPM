package vn.doan.dto.response;

import java.util.List;

public class CategoryWithProductsResponse {
    private String categoryId;
    private String categoryName;
    
    // Tái sử dụng lại ProductResponse mà ông đã tạo lúc nãy
    private List<ProductResponse> products;

    public CategoryWithProductsResponse() {}

    public CategoryWithProductsResponse(String categoryId, String categoryName, List<ProductResponse> products) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.products = products;
    }

    // Getters & Setters
    public String getCategoryId() { return categoryId; }

    public String getCategoryName() { return categoryName; }

    public List<ProductResponse> getProducts() { return products; }

}