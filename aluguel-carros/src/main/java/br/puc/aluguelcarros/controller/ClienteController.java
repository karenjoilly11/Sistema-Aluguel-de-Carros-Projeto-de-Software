package br.puc.aluguelcarros.controller;

import br.puc.aluguelcarros.dto.ClienteDTO;
import br.puc.aluguelcarros.model.Cliente;
import br.puc.aluguelcarros.service.ClienteService;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.authentication.Authentication;
import io.micronaut.security.rules.SecurityRule;
import jakarta.annotation.Nullable;

import java.util.List;

/**
 * Controller REST para gerenciamento de clientes.
 *
 * <p>Todos os endpoints exigem autenticação, exceto onde sobrescrito.
 * Retorna {@link br.puc.aluguelcarros.dto.ClienteDTO} nos endpoints de listagem
 * para evitar serialização circular.</p>
 *
 * <p>Endpoints:
 * <ul>
 *   <li>{@code GET  /clientes}      — lista todos os clientes (autenticado)</li>
 *   <li>{@code GET  /clientes/me}   — retorna dados do usuário logado via JWT</li>
 *   <li>{@code GET  /clientes/{id}} — busca cliente por ID</li>
 *   <li>{@code POST /clientes}      — cadastra cliente (público)</li>
 *   <li>{@code PUT  /clientes/{id}} — atualiza dados do cliente</li>
 *   <li>{@code DELETE /clientes/{id}} — remove cliente</li>
 * </ul>
 * </p>
 */
@Controller("/clientes")
@Secured(SecurityRule.IS_AUTHENTICATED)
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @Get
    public List<ClienteDTO> listarClientes() {
        return clienteService.listarTodosDTO();
    }

    @Get("/me")
    public HttpResponse<java.util.Map<String, Object>> meuPerfil(@Nullable Authentication auth) {
        if (auth == null) {
            return HttpResponse.unauthorized();
        }
        java.util.Map<String, Object> dados = new java.util.HashMap<>();
        dados.put("id", auth.getAttributes().get("id"));
        dados.put("email", auth.getName());
        dados.put("nome", auth.getAttributes().get("nome"));
        dados.put("role", auth.getAttributes().get("role"));
        return HttpResponse.ok(dados);
    }

    @Get("/{id}")
    public HttpResponse<ClienteDTO> buscarCliente(Long id) {
        try {
            return HttpResponse.ok(clienteService.buscarPorIdDTO(id));
        } catch (RuntimeException e) {
            return HttpResponse.notFound();
        }
    }

    @Post
    @Secured(SecurityRule.IS_ANONYMOUS)
    public HttpResponse<Cliente> cadastrarCliente(@Body Cliente cliente) {
        return HttpResponse.created(clienteService.cadastrarCliente(cliente));
    }

    @Put("/{id}")
    public HttpResponse<Cliente> atualizarCliente(Long id, @Body Cliente dados) {
        return HttpResponse.ok(clienteService.atualizarDados(id, dados));
    }

    @Delete("/{id}")
    public HttpResponse<Void> excluirCliente(Long id) {
        clienteService.excluirCadastro(id);
        return HttpResponse.noContent();
    }
}
