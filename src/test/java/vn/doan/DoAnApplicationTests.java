package vn.doan;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import vn.doan.repository.CategoryRepository;
import vn.doan.repository.UserRepository;

import vn.doan.repository.ProductRepository;

import vn.doan.repository.IngredientRepository; 
import vn.doan.repository.InventoryTransactionRepository;

@SpringBootTest
@Import(DoAnApplicationTests.TestJdbcConfiguration.class)
class DoAnApplicationTests {

@MockBean
    private UserRepository userRepository;
@MockBean
    private CategoryRepository categoryRepository;
@MockBean
    private ProductRepository productRepository;

    @MockBean
     private IngredientRepository ingredientRepository;
    
    @MockBean
    private InventoryTransactionRepository inventoryTransactionRepository;
    
    @Test
    void contextLoads() {
    }

    @TestConfiguration
    static class TestJdbcConfiguration {

        @Bean
        JdbcTemplate jdbcTemplate() {
            return new JdbcTemplate(new DriverManagerDataSource("jdbc:test-only"));
        }
    }
}
