package vn.doan.dto.response;

public class ToppingResponse {
    private String id;
    private String name;
    private long price;
    private boolean isAvailable;

    public ToppingResponse() {}

    public ToppingResponse(String id, String name, long price, boolean isAvailable) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.isAvailable = isAvailable;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public long getPrice() { return price; }
    public void setPrice(long price) { this.price = price; }
    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }
}