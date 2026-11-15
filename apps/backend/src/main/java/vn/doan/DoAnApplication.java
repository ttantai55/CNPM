package vn.doan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DoAnApplication {

    public static void main(String[] args) {
        SpringApplication.run(DoAnApplication.class, args);
    }
}
