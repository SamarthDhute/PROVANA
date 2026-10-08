package com.provana.inventory.entity;

import com.provana.catalog.entity.Sku;
import com.provana.common.audit.BaseEntity;
import jakarta.persistence.*;

import java.util.UUID;

/**
 * Inventory Entity representing live stock levels per purchasable SKU.
 */
@Entity
@Table(name = "inventory", indexes = {
        @Index(name = "idx_inventory_sku_id", columnList = "sku_id"),
        @Index(name = "idx_inventory_status", columnList = "status"),
        @Index(name = "idx_inventory_low_stock", columnList = "available_quantity, low_stock_threshold")
})
public class Inventory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sku_id", nullable = false, unique = true)
    private Sku sku;

    @Column(name = "available_quantity", nullable = false)
    private Integer availableQuantity = 0;

    @Column(name = "reserved_quantity", nullable = false)
    private Integer reservedQuantity = 0;

    @Column(name = "sold_quantity", nullable = false)
    private Integer soldQuantity = 0;

    @Column(name = "low_stock_threshold", nullable = false)
    private Integer lowStockThreshold = 5;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private InventoryStatus status = InventoryStatus.IN_STOCK;

    public Inventory() {
    }

    public Inventory(Sku sku, Integer initialStock, Integer lowStockThreshold) {
        this.sku = sku;
        this.availableQuantity = initialStock != null ? initialStock : 0;
        this.reservedQuantity = 0;
        this.soldQuantity = 0;
        this.lowStockThreshold = lowStockThreshold != null ? lowStockThreshold : 5;
        recalculateStatus();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Sku getSku() {
        return sku;
    }

    public void setSku(Sku sku) {
        this.sku = sku;
    }

    public Integer getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity;
        recalculateStatus();
    }

    public Integer getReservedQuantity() {
        return reservedQuantity;
    }

    public void setReservedQuantity(Integer reservedQuantity) {
        this.reservedQuantity = reservedQuantity;
        recalculateStatus();
    }

    public Integer getSoldQuantity() {
        return soldQuantity;
    }

    public void setSoldQuantity(Integer soldQuantity) {
        this.soldQuantity = soldQuantity;
    }

    public Integer getLowStockThreshold() {
        return lowStockThreshold;
    }

    public void setLowStockThreshold(Integer lowStockThreshold) {
        this.lowStockThreshold = lowStockThreshold;
        recalculateStatus();
    }

    public InventoryStatus getStatus() {
        return status;
    }

    public void setStatus(InventoryStatus status) {
        this.status = status;
    }

    /**
     * Sellable stock = Available quantity - Reserved quantity.
     */
    public int getSellableQuantity() {
        return Math.max(0, availableQuantity - reservedQuantity);
    }

    public boolean isLowStock() {
        int sellable = getSellableQuantity();
        return sellable > 0 && sellable <= lowStockThreshold;
    }

    public boolean isOutOfStock() {
        return getSellableQuantity() <= 0;
    }

    public void recalculateStatus() {
        int sellable = getSellableQuantity();
        if (sellable <= 0) {
            this.status = InventoryStatus.OUT_OF_STOCK;
        } else if (sellable <= lowStockThreshold) {
            this.status = InventoryStatus.LOW_STOCK;
        } else {
            this.status = InventoryStatus.IN_STOCK;
        }
    }
}
