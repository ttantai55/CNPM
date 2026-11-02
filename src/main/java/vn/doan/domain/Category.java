package vn.doan.domain;

public class Category {
    private String id;
    private String name;
    private String description;

    // Constructor rỗng (Mặc định)
    public Category() {
    }

    // Constructor đầy đủ tham số
    public Category(String id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }

    // --- GETTER & SETTER ---

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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
}