package vn.doan.domain;

    public class OrderItemTopping {
    private String id;
    private int quantity;
    private long price;

    // Constructor rỗng (Mặc định)
    public OrderItemTopping() {
    }

    // Constructor đầy đủ tham số
    public OrderItemTopping(String id, int quantity, long price) {
        this.id = id;
        this.quantity = quantity;
        this.price = price;
    }

    // --- GETTER & SETTER ---

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public long getPrice() {
        return price;
    }

    public void setPrice(long price) {
        this.price = price;
    }
}
    

