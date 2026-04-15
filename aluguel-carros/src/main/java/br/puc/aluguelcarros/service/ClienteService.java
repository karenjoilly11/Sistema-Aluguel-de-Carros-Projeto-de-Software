package br.puc.aluguelcarros.service;

import br.puc.aluguelcarros.dto.ClienteDTO;
import br.puc.aluguelcarros.model.Cliente;
import br.puc.aluguelcarros.repository.ClienteRepository;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;
import org.mindrot.jbcrypt.BCrypt;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Singleton
public class ClienteService {

    private final ClienteRepository repository;

    public ClienteService(ClienteRepository repository) {
        this.repository = repository;
    }

    public Cliente cadastrarCliente(Cliente cliente) {
        String hash = BCrypt.hashpw(cliente.getSenhaHash(), BCrypt.gensalt());
        cliente.setSenhaHash(hash);
        return repository.save(cliente);
    }

    public Optional<Cliente> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Optional<Cliente> buscarPorEmail(String email) {
        return repository.findByEmail(email);
    }

    public List<Cliente> listarTodos() {
        return repository.findAll();
    }

    @Transactional
    public List<ClienteDTO> listarTodosDTO() {
        return repository.findAll().stream().map(c -> {
            ClienteDTO dto = new ClienteDTO();
            dto.setId(c.getId());
            dto.setNome(c.getNome());
            dto.setEmail(c.getEmail());
            dto.setRole(c.getRole());
            dto.setCpf(c.getCpf());
            dto.setEndereco(c.getEndereco());
            dto.setProfissao(c.getProfissao());
            dto.setRendimentos(
                c.getRendimentos().stream().map(r -> {
                    ClienteDTO.RendimentoDTO rd = new ClienteDTO.RendimentoDTO();
                    rd.setId(r.getId());
                    rd.setTipo(r.getTipo());
                    rd.setValor(r.getValor());
                    rd.setComprovante(r.getComprovante());
                    return rd;
                }).collect(Collectors.toList())
            );
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public ClienteDTO buscarPorIdDTO(Long id) {
        Cliente c = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado: " + id));
        ClienteDTO dto = new ClienteDTO();
        dto.setId(c.getId());
        dto.setNome(c.getNome());
        dto.setEmail(c.getEmail());
        dto.setRole(c.getRole());
        dto.setCpf(c.getCpf());
        dto.setEndereco(c.getEndereco());
        dto.setProfissao(c.getProfissao());
        dto.setRendimentos(
            c.getRendimentos().stream().map(r -> {
                ClienteDTO.RendimentoDTO rd = new ClienteDTO.RendimentoDTO();
                rd.setId(r.getId());
                rd.setTipo(r.getTipo());
                rd.setValor(r.getValor());
                rd.setComprovante(r.getComprovante());
                return rd;
            }).collect(Collectors.toList())
        );
        return dto;
    }

    public Cliente atualizarDados(Long id, Cliente dados) {
        Cliente cliente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado: " + id));
        cliente.setNome(dados.getNome());
        cliente.setEmail(dados.getEmail());
        cliente.setEndereco(dados.getEndereco());
        cliente.setProfissao(dados.getProfissao());
        return repository.update(cliente);
    }

    public void excluirCadastro(Long id) {
        repository.deleteById(id);
    }
}
