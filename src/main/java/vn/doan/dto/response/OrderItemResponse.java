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

    public OrderItemResponse() {
    }

    public OrderItemResponse(String id, String productId, String productName, long quantity, 
                             long unitPrice, long subtotal, String note, List<String> toppingNames) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = subtotal;
        this.note = note;
        this.toppingNames = toppingNames;
    }

    // --- GETTERS & SETTERS ---
    public String getId() { 
        return id; 
        }

    public void setId(String id) { 
        this.id = id; 
        }

    public String getProductId() { 
        return productId; 
        }

    public void setProductId(String productId) { 
        this.productId = productId; 
        }

    public String getProductName() { 
        return productName; 
        }

    public void setProductName(String productName) { 
        this.productName = productName; 
        }

    public long getQuantity() { 
        return quantity; 
        }

    public void setQuantity(long quantity) { 
        this.quantity = quantity; 
        }

    public long getUnitPrice() { 
        return unitPrice; 
        }

    public void setUnitPrice(long unitPrice) { 
        this.unitPrice = unitPrice; 
        }

    public long getSubtotal() { 
        return subtotal; 
        }

    public void setSubtotal(long subtotal) { 
        this.subtotal = subtotal; 
        }

    public String getNote() { 
        return note; 
        }

    public void setNote(String note) { 
        this.note = note; 
        }

    public List<String> getToppingNames() { 
        return toppingNames; 
        }

    public void setToppingNames(List<String> toppingNames) { 
        this.toppingNames = toppingNames; 
        }
}