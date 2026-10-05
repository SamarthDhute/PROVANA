package com.provana.catalog.repository;

import com.provana.catalog.entity.ProductNutrition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductNutritionRepository extends JpaRepository<ProductNutrition, UUID> {

    Optional<ProductNutrition> findByProductId(UUID productId);
}
