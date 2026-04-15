package br.puc.aluguelcarros.service;

import br.puc.aluguelcarros.model.Automovel;
import br.puc.aluguelcarros.model.Contrato;
import br.puc.aluguelcarros.model.PedidoAluguel;
import br.puc.aluguelcarros.dto.ContratoDTO;
import br.puc.aluguelcarros.dto.PedidoDTO;
import br.puc.aluguelcarros.repository.AutomovelRepository;
import br.puc.aluguelcarros.repository.ContratoRepository;
import br.puc.aluguelcarros.repository.PedidoRepository;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço responsável pela lógica de negócio dos pedidos de aluguel.
 *
 * <p>Responsabilidades:
 * <ul>
 *   <li><strong>criarSolicitacao:</strong> valida automóvel disponível, valida datas
 *       (início deve ser antes do fim), calcula {@code valorTotal} com base em
 *       {@code valorDiaria × dias}, salva com status {@code PENDENTE}.</li>
 *   <li><strong>listarTodosDTO / listarPorCliente:</strong> retornam {@link br.puc.aluguelcarros.dto.PedidoDTO}
 *       dentro de {@code @Transactional} para acessar as associações LAZY
 *       sem erro de "no Session".</li>
 *   <li><strong>cancelarSolicitacao:</strong> muda o status para {@code CANCELADO}.</li>
 *   <li><strong>converterParaContrato:</strong> aprova o pedido e gera um
 *       {@link br.puc.aluguelcarros.model.Contrato} retornado como
 *       {@link br.puc.aluguelcarros.dto.ContratoDTO}.</li>
 * </ul>
 * </p>
 */
@Singleton
public class PedidoService {

    private final PedidoRepository repository;
    private final AutomovelRepository autoRepo;
    private final ContratoRepository contratoRepo;

    public PedidoService(PedidoRepository repository, AutomovelRepository autoRepo, ContratoRepository contratoRepo) {
        this.repository   = repository;
        this.autoRepo     = autoRepo;
        this.contratoRepo = contratoRepo;
    }

    @Transactional
    public PedidoDTO criarSolicitacao(PedidoAluguel pedido) {
        // Validar automóvel
        Automovel auto = autoRepo.findById(pedido.getAutomovel().getId())
                .orElseThrow(() -> new RuntimeException("Automóvel não encontrado"));
        if (!auto.isDisponivel()) {
            throw new RuntimeException("Automóvel não disponível para aluguel");
        }

        // Validar datas
        if (pedido.getDataInicio() == null || pedido.getDataFim() == null) {
            throw new RuntimeException("Data de início e fim são obrigatórias");
        }
        if (pedido.getDataInicio().isAfter(pedido.getDataFim()) || pedido.getDataInicio().isEqual(pedido.getDataFim())) {
            throw new RuntimeException("Data de devolução deve ser após a retirada");
        }

        // Calcular valor
        long dias = ChronoUnit.DAYS.between(pedido.getDataInicio(), pedido.getDataFim());
        if (dias <= 0) dias = 1;
        pedido.setValorTotal(auto.getValorDiaria() * dias);
        pedido.setStatus("PENDENTE");
        PedidoAluguel salvo = repository.save(pedido);
        return toDTO(salvo);
    }

    @Transactional
    public List<PedidoDTO> listarTodosDTO() {
        return repository.findAll().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public List<PedidoDTO> listarPorCliente(Long clienteId) {
        return repository.findByClienteId(clienteId).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public void cancelarSolicitacao(Long id) {
        PedidoAluguel pedido = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado: " + id));
        pedido.setStatus("CANCELADO");
        repository.update(pedido);
    }

    public void rejeitarSolicitacao(Long id) {
        PedidoAluguel pedido = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado: " + id));
        if (!"PENDENTE".equals(pedido.getStatus())) {
            throw new RuntimeException("Apenas pedidos PENDENTE podem ser rejeitados");
        }
        pedido.setStatus("CANCELADO");
        repository.update(pedido);
    }

    private PedidoDTO toDTO(PedidoAluguel p) {
        return new PedidoDTO(
            p.getId(), p.getDataInicio(), p.getDataFim(), p.getStatus(), p.getValorTotal(),
            p.getCliente().getId(), p.getAutomovel().getId(),
            p.getCpfInformado(), p.getRendaInformada(), p.getObservacao()
        );
    }

    @Transactional
    public ContratoDTO converterParaContrato(Long id) {
        PedidoAluguel pedido = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado: " + id));
        pedido.setStatus("APROVADO");
        repository.update(pedido);

        Contrato contrato = new Contrato();
        contrato.setPedidoAluguel(pedido);
        contrato.setValorFinal(pedido.getValorTotal());
        contrato.setTermos("Contrato de aluguel gerado automaticamente.");
        Contrato salvo = contratoRepo.save(contrato);

        ContratoDTO dto = new ContratoDTO();
        dto.setId(salvo.getId());
        dto.setTermos(salvo.getTermos());
        dto.setValorFinal(salvo.getValorFinal());
        dto.setAssinado(salvo.isAssinado());
        dto.setPedidoId(pedido.getId());
        dto.setStatusPedido(pedido.getStatus());
        return dto;
    }
}
