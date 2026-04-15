package br.puc.aluguelcarros.service;

import br.puc.aluguelcarros.model.Usuario;
import br.puc.aluguelcarros.model.Cliente;
import br.puc.aluguelcarros.repository.UsuarioRepository;
import br.puc.aluguelcarros.repository.ClienteRepository;
import jakarta.inject.Singleton;
import org.mindrot.jbcrypt.BCrypt;

import java.util.Optional;

@Singleton
public class AuthService {

    private final UsuarioRepository userRepo;
    private final ClienteRepository clienteRepo;

    public AuthService(UsuarioRepository userRepo, ClienteRepository clienteRepo) {
        this.userRepo = userRepo;
        this.clienteRepo = clienteRepo;
    }

    public boolean validarAcesso(String email, String senha) {
        Optional<Usuario> usuario = userRepo.findByEmail(email);
        return usuario.isPresent() && BCrypt.checkpw(senha, usuario.get().getSenhaHash());
    }

    public Optional<Usuario> buscarPorEmail(String email) {
        return userRepo.findByEmail(email);
    }

    public Usuario registrar(String nome, String email, String senha, String role) {
        if (userRepo.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email já cadastrado: " + email);
        }
        Usuario u;
        if ("CLIENTE".equals(role)) {
            u = new Cliente();
            u.setEmail(email);
            u.setSenhaHash(BCrypt.hashpw(senha, BCrypt.gensalt()));
            u.setNome(nome);
            u.setRole(role);
            return clienteRepo.save((Cliente) u);
        } else {
            u = new Usuario(email, BCrypt.hashpw(senha, BCrypt.gensalt()), nome, role);
            return userRepo.save(u);
        }
    }

    public boolean existeAlgumUsuario() {
        return userRepo.count() > 0;
    }
}
