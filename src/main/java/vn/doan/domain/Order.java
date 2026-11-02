package vn.doan.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import vn.doan.domain.enums.OrderStatus;

public class Order {

    private String id;
    private String customerId;
    private long totalAmount;
    private OrderStatus status = OrderStatus.PENDING; // Gán mặc định khi tạo mới
    private LocalDateTime createdAt;
    private final List<OrderItem> items = new ArrayList<>();

    public Order() {
    }

    public Order(String id, String customerId, long totalAmount, OrderStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.customerId = customerId;
        this.totalAmount = totalAmount;
        this.status = status;
        this.createdAt = createdAt;
    } 

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public long getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(long totalAmount) {
        if (totalAmount < 0) {
            throw new IllegalArgumentException("Tổng tiền không được âm");
        }
        this.totalAmount = totalAmount;
    }

    public OrderStatus getStatus() { 
        return status; 
    }

    public void setStatus(OrderStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Trạng thái không được để null!");
        }
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // --- CÁC PHƯƠNG THỨC CHUYỂN ĐỔI TRẠNG THÁI (ĐÃ SỬA DÙNG ENUM) ---

    public void confirm() {
        if (this.status != OrderStatus.PENDING) {
            throw new IllegalStateException("Chỉ đơn đang chờ mới được xác nhận");
        }
        // Lưu ý: Đảm bảo trong OrderStatus đã có CONFIRMED, nếu chưa thì thêm vào enum
        this.status = OrderStatus.CONFIRMED;
    }

    public void cancel() {
        if (this.status != OrderStatus.PENDING && this.status != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Chỉ đơn đang chờ hoặc đã xác nhận mới được hủy");
        }
        this.status = OrderStatus.CANCELLED;
    }

    public void complete() {
        if (this.status != OrderStatus.CONFIRMED && this.status != OrderStatus.PENDING) {
            throw new IllegalStateException("Đơn hàng chưa đủ điều kiện để hoàn tất");
        }
        this.status = OrderStatus.COMPLETED;
    }

    // --- QUẢN LÝ DANH SÁCH ORDER ITEM ---

    public List<OrderItem> getItems() {
        return List.copyOf(items);
    }

    public void addItem(OrderItem item) {
        if (this.status != OrderStatus.PENDING) {
            throw new IllegalStateException("Chỉ được thay đổi món khi đơn hàng đang chờ");
        }
        if (item == null) {
            throw new IllegalArgumentException("Món hàng không được để trống");
        }
        if (id == null || id.isBlank()) {
            throw new IllegalStateException("Mã đơn hàng không được để trống");
        }
        if (item.getOrderId() == null || item.getOrderId().isBlank()) {
            item.setOrderId(id);
        } else if (!id.equals(item.getOrderId())) {
            throw new IllegalArgumentException("Món hàng không thuộc đơn hàng này");
        }

        item.validate();
        items.add(item);
        recalculateTotal();
    }

    public void removeItem(String itemId) {
        if (this.status != OrderStatus.PENDING) {
            throw new IllegalStateException("Chỉ được thay đổi món khi đơn hàng đang chờ");
        }
        if (itemId == null || itemId.isBlank()) {
            throw new IllegalArgumentException("Mã món hàng không được để trống");
        }

        items.removeIf(item -> itemId.equals(item.getId()));
        recalculateTotal();
    }

    public boolean isEmpty() {
        return items.isEmpty();
    }

    public void restoreItems(List<OrderItem> restoredItems) {
        if (id == null || id.isBlank()) {
            throw new IllegalStateException("Mã đơn hàng không được để trống");
        }
        long persistedTotal = totalAmount;
        items.clear();
        if (restoredItems != null) {
            for (OrderItem item : restoredItems) {
                if (item == null) {
                    throw new IllegalStateException("Danh sách đơn hàng chứa phần tử null");
                }
                if (!id.equals(item.getOrderId())) {
                    throw new IllegalStateException("Món hàng không thuộc đơn hàng này");
                }
                item.validate();
                items.add(item);
            }
        }
        recalculateTotal();
        if (persistedTotal != totalAmount) {
            throw new IllegalStateException("Tổng tiền đơn hàng không khớp với các món hàng");
        }
    }

    public void validate() {
        if (id == null || id.isBlank()) {
            throw new IllegalStateException("Mã đơn hàng không được để trống");
        }
        if (customerId == null || customerId.isBlank()) {
            throw new IllegalStateException("Mã khách hàng không được để trống");
        }
        // Vì status là kiểu Enum nên chỉ cần check null, không cần VALID_STATUSES nữa
        if (status == null) {
            throw new IllegalStateException("Trạng thái đơn hàng không được để trống");
        }
        if (createdAt == null) {
            throw new IllegalStateException("Ngày tạo đơn không được để trống");
        }
        if (totalAmount < 0) {
            throw new IllegalStateException("Tổng tiền không được âm");
        }
        if (items.isEmpty()) {
            throw new IllegalStateException("Đơn hàng phải có ít nhất một món");
        }
        long calculatedTotal = 0;
        for (OrderItem item : items) {
            item.validate();
            calculatedTotal = Math.addExact(calculatedTotal, item.getSubTotal());
        }
        if (calculatedTotal != totalAmount) {
            throw new IllegalStateException("Tổng tiền đơn hàng không khớp với các món hàng");
        }
    }

    private void recalculateTotal() {
        long calculatedTotal = 0;
        for (OrderItem item : items) {
            calculatedTotal = Math.addExact(calculatedTotal, item.getSubTotal());
        }
        totalAmount = calculatedTotal;
    }
}