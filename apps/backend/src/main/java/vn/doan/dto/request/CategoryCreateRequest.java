package vn.doan.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CategoryCreateRequest {

    @NotBlank(message = "Tên danh mục không được để trống")
    private String name;

    private String description;
    private String slug;

    public CategoryCreateRequest() {
    }

    public CategoryCreateRequest(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public CategoryCreateRequest(String name, String description, String slug) {
        this(name, description);
        this.slug = slug;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
}