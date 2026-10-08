package com.provana.inventory.repository;

import com.provana.inventory.entity.InventoryMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, UUID> {

    Page<InventoryMovement> findBySkuIdOrderByCreatedAtDesc(UUID skuId, Pageable pageable);

    Page<InventoryMovement> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
