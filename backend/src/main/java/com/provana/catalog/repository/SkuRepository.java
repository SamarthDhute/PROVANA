package com.provana.catalog.repository;

import com.provana.catalog.entity.Sku;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SkuRepository extends JpaRepository<Sku, UUID> {

    Optional<Sku> findBySkuCode(String skuCode);

    boolean existsBySkuCode(String skuCode);

    boolean existsBySkuCodeAndIdNot(String skuCode, UUID id);

    List<Sku> findByVariantIdAndActiveTrue(UUID variantId);

    List<Sku> findByVariantId(UUID variantId);
}
