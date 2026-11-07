package vn.doan.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.doan.repository.ProductRepository;

@Service 
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public void getMenu() {
        // Logic lấy danh sách thực đơn sẽ viết ở đây
    }

    @Transactional
    public void createProduct() {
        // Logic thêm sản phẩm mới sẽ viết ở đây
    }
}