package com.provana.inventory.repository;

import com.provana.inventory.entity.Inventory;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, UUID> {

    Optional<Inventory> findBySkuId(UUID skuId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.sku.id = :skuId")
    Optional<Inventory> findBySkuIdWithLock(@Param("skuId") UUID skuId);

    boolean existsBySkuId(UUID skuId);

    @Query("SELECT i FROM Inventory i WHERE (i.availableQuantity - i.reservedQuantity) <= i.lowStockThreshold")
    Page<Inventory> findLowStock(Pageable pageable);
}
