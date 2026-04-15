package br.puc.aluguelcarros.controller;

import br.puc.aluguelcarros.model.Usuario;
import br.puc.aluguelcarros.service.AuthService;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.authentication.Authentication;
import io.micronaut.security.rules.SecurityRule;
import io.micronaut.security.token.generator.TokenGenerator;

import java.util.Map;
import java.util.Optional;

/**
 * Controller responsável por autenticação e registro de usuários.
 *
 * <p>Todos os endpoints são públicos ({@code IS_ANONYMOUS}) pois são
 * acessados antes do login.</p>
 *
 * <p>Endpoints disponíveis:
 * <ul>
 *   <li>{@code POST /auth/login} — autentica e retorna JWT + dados do usuário</li>
 *   <li>{@code POST /auth/registrar} — auto-cadastro público como CLIENTE</li>
 *   <li>{@code POST /auth/setup} — cria o primeiro ADMIN (executado apenas uma vez)</li>
 * </ul>
 * </p>
 */
@Controller("/auth")
@Secured(SecurityRule.IS_ANONYMOUS)
public class AuthController {

    private final AuthService authService;
    private final TokenGenerator tokenGenerator;

    public AuthController(AuthService authService,
                          TokenGenerator tokenGenerator) {
        this.authService    = authService;
        this.tokenGenerator = tokenGenerator;
    }

    @Post("/login")
    public HttpResponse<?> login(@Body Map<String, String> body) {
        String email = body.get("email");
        String senha = body.get("senha");
        Optional<Usuario> optUsuario = authService.buscarPorEmail(email);
        if (optUsuario.isEmpty() || !authService.validarAcesso(email, senha)) {
            return HttpResponse.unauthorized();
        }
        Usuario usuario = optUsuario.get();

        // Gera token JWT com claims do usuário
        Authentication auth = Authentication.build(
                usuario.getEmail(),
                Map.of(
                        "id",   usuario.getId(),
                        "nome", usuario.getNome(),
                        "role", usuario.getRole()
                )
        );
        Optional<String> tokenOpt = tokenGenerator.generateToken(auth, 86400);
        if (tokenOpt.isEmpty()) {
            return HttpResponse.serverError("Erro ao gerar token");
        }

        return HttpResponse.ok(Map.of(
                "token", tokenOpt.get(),
                "nome",  usuario.getNome(),
                "email", usuario.getEmail(),
                "role",  usuario.getRole()
        ));
    }

    /**
     * Cria o primeiro usuário admin do sistema.
     * Só funciona enquanto não existir nenhum usuário no banco.
     */
    @Post("/setup")
    public HttpResponse<?> setup(@Body Map<String, String> body) {
        if (authService.existeAlgumUsuario()) {
            return HttpResponse.badRequest(Map.of("message", "Setup já foi realizado. Use /auth/registrar."));
        }
        String nome  = body.getOrDefault("nome", "Admin");
        String email = body.get("email");
        String senha = body.get("senha");
        if (email == null || senha == null) {
            return HttpResponse.badRequest(Map.of("message", "email e senha são obrigatórios."));
        }
        Usuario criado = authService.registrar(nome, email, senha, "ADMIN");
        return HttpResponse.created(Map.of(
                "id",    criado.getId(),
                "nome",  criado.getNome(),
                "email", criado.getEmail(),
                "role",  criado.getRole()
        ));
    }

    /**
     * Auto-cadastro público: qualquer pessoa pode criar uma conta de CLIENTE.
     */
    @Post("/registrar")
    public HttpResponse<?> registrar(@Body Map<String, String> body) {
        String nome  = body.get("nome");
        String email = body.get("email");
        String senha = body.get("senha");
        if (nome == null || nome.isBlank() || email == null || senha == null || senha.length() < 6) {
            return HttpResponse.badRequest(Map.of("message", "Nome, email e senha (mín. 6 caracteres) são obrigatórios."));
        }
        try {
            // Auto-cadastro sempre cria como CLIENTE
            Usuario criado = authService.registrar(nome.trim(), email.trim(), senha, "CLIENTE");
            return HttpResponse.created(Map.of(
                    "id",    criado.getId(),
                    "nome",  criado.getNome(),
                    "email", criado.getEmail(),
                    "role",  criado.getRole()
            ));
        } catch (RuntimeException e) {
            return HttpResponse.badRequest(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Criação de usuário com role customizada — somente ADMIN (via /usuarios).
     * Mantido aqui apenas internamente; a rota pública é /registrar.
     */
}
