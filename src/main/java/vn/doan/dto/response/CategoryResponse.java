package vn.doan.dto.response;

public class CategoryResponse {
    private String id;
    private String name;
    private String description;
    private boolean isActive;
    public CategoryResponse() {
    }

 

public CategoryResponse(String id, String name, String description, boolean isActive) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.isActive = isActive;
}
    

    public String getId() {
        return id;
    }



    public String getName() {
        return name;
    }



    public String getDescription() {
        return description;
    }

    public boolean isActive() {
        return isActive;
    }
}