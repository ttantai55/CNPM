package vn.doan.dto.response;

import java.util.List;

public class OrderItemResponse {

    private String id;
    private String productId;
    private String productName;
    private long quantity;
    private long unitPrice;
    private long subtotal; // Thành tiền = quantity * unitPrice
    private String note;
    
    // Tên các Topping đi kèm (Thay vì nguyên object Topping)
    private List<String> toppingNames;
    private String size;
    private Integer sugarPercent;
    private Integer icePercent;
    private List<String> toppings;

    public OrderItemResponse() {
    }

    public OrderItemResponse(String id, String productId, String productName, long quantity, 
                             long unitPrice, long subtotal, String note, List<String> toppingNames) {
        this(id, productId, productName, quantity, unitPrice, subtotal, note, toppingNames, null, null, null, toppingNames);
    }

    public OrderItemResponse(String id, String productId, String productName, long quantity,
                             long unitPrice, long subtotal, String note, List<String> toppingNames,
                             String size, Integer sugarPercent, Integer icePercent, List<String> toppings) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = subtotal;
        this.note = note;
        this.toppingNames = toppingNames;
        this.size = size;
        this.sugarPercent = sugarPercent;
        this.icePercent = icePercent;
        this.toppings = toppings;
    }

    // --- GETTERS & SETTERS ---
    public String getId() { 
        return id; 
        }

    public String getProductId() { 
        return productId; 
        }

    public String getProductName() { 
        return productName; 
        }

    public long getQuantity() { 
        return quantity; 
        }

    public long getUnitPrice() { 
        return unitPrice; 
        }

    public long getSubtotal() { 
        return subtotal; 
        }

    public String getNote() { 
        return note; 
        }

    public List<String> getToppingNames() { 
        return toppingNames; 
        }
    public String getSize() { return size; }
    public Integer getSugarPercent() { return sugarPercent; }
    public Integer getIcePercent() { return icePercent; }
    public List<String> getToppings() { return toppings; }
}