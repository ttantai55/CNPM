package vn.doan.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

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

    public String getName() { return name; }

    public long getPrice() { return price; }

    @JsonProperty("isAvailable")
    public boolean isAvailable() { return isAvailable; }
}