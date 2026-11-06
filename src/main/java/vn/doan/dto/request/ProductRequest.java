package vn.doan.dto.request;

import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Builder;

@Builder 
public class ProductRequest {
    
    private String name;

    private long price;

    private String description;

    private String imageUrl;

   
}
