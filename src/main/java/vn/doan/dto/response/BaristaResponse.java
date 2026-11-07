package vn.doan.dto.response;

public class BaristaResponse {
    private String id;
    private String name;

    public BaristaResponse() {}

    public BaristaResponse(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public String getId() { return id; }

    public String getName() { return name; }

}