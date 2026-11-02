package vn.doan.domain;
import jakarta.persistence.*;

@Entity
@Table(name = "order_item_toppings")

    public class OrderItemTopping {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Quan hệ Nhiều - 1: Nhiều lựa chọn topping thuộc về 1 dòng chi tiết sản phẩm (OrderItem)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItem orderItem;

    // Quan hệ Nhiều - 1: Lựa chọn này ứng với Topping nào trong menu
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topping_id", nullable = false)

    @Column(nullable = false)
    private Topping topping;

    @Column(nullable = false)
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
    

