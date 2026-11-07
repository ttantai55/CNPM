package vn.doan.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;


@Service 
@RequiredArgsConstructor
public interface ProductService {

    public void getMenu();
    public void createProduct();
}
