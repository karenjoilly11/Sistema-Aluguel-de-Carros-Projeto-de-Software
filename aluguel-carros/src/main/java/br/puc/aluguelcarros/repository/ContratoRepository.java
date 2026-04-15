package br.puc.aluguelcarros.repository;

import br.puc.aluguelcarros.model.Contrato;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.jpa.repository.JpaRepository;

import java.util.Optional;

@Repository
public interface ContratoRepository extends JpaRepository<Contrato, Long> {
    @io.micronaut.data.annotation.Query("SELECT c FROM Contrato c WHERE c.pedido.id = :pedidoId")
    Optional<Contrato> findByPedidoId(Long pedidoId);
}
