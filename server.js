require('dotenv').config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors({
    origin: '*'
}));
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.log("Erro ao conectar no MySQL", err);
        return;
    }
    console.log("Conectado ao MySQL");
});

// LOGIN
app.post("/api/login", (req, res) => {
    const { email, senha } = req.body;
    const sql = "SELECT id, nome, email, nivel, criado_em, primeiro_acesso FROM usuarios WHERE email = ? AND senha = ?";
    db.query(sql, [email, senha], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length > 0) {
            res.json({ success: true, usuario: result[0], precisaTrocarSenha: result[0].primeiro_acesso === 1 });
        } else {
            res.json({ success: false, message: "Usuário ou senha inválidos" });
        }
    });
});

// PRIMEIRO ACESSO
app.post("/api/primeiro-acesso", (req, res) => {
    const { email } = req.body;
    const sql = "SELECT * FROM usuarios WHERE email = ?";
    db.query(sql, [email], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length > 0) {
            res.json({ success: true, message: "E-mail encontrado. Verifique sua caixa de entrada." });
        } else {
            res.status(404).json({ success: false, message: "E-mail não encontrado." });
        }
    });
});

// LISTAR EQUIPAMENTOS
app.get("/api/equipamentos", (req, res) => {
    db.query("SELECT * FROM equipamentos", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// CADASTRAR EQUIPAMENTO
app.post("/api/equipamentos", (req, res) => {
    const {
        numero, operadora, modelo, imei, dataRetirada,
        matricula, nome, funcao, cpf, estado, cidade,
        dataLiberacao, termoAssinado, gmail, senhagmail, obs
    } = req.body;

    db.query(
        `INSERT INTO equipamentos 
        (numero, operadora, modelo, imei, data_retirada, matricula, nome, funcao, cpf, estado, cidade, data_liberacao, termo_assinado, gmail, senhagmail, obs) 
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
            numero, operadora, modelo, imei,
            dataRetirada || null, matricula, nome, funcao,
            cpf, estado, cidade, dataLiberacao || null,
            termoAssinado ? 1 : 0, gmail, senhagmail, obs
        ],
        (err, result) => {
            if (err) {
                console.log("Erro ao cadastrar:", err)
                return res.status(500).json(err);
            }
            res.json({ id: result.insertId, ...req.body });
        }
    );
});

// EDITAR EQUIPAMENTO
app.put("/api/equipamentos/:id", (req, res) => {
    const { id } = req.params;
    const {
        numero, operadora, modelo, imei, dataRetirada,
        matricula, nome, funcao, cpf, estado, cidade,
        dataLiberacao, termoAssinado, gmail, senhagmail, obs
    } = req.body;

    db.query(
        `UPDATE equipamentos SET 
        numero=?, operadora=?, modelo=?, imei=?, data_retirada=?, matricula=?, nome=?, 
        funcao=?, cpf=?, estado=?, cidade=?, data_liberacao=?, termo_assinado=?, 
        gmail=?, senhagmail=?, obs=? 
        WHERE id=?`,
        [
            numero, operadora, modelo, imei,
            dataRetirada || null, matricula, nome, funcao,
            cpf, estado, cidade, dataLiberacao || null,
            termoAssinado ? 1 : 0, gmail, senhagmail, obs, id
        ],
        (err) => {
            if (err) {
                console.log("Erro ao editar:", err)
                return res.status(500).json(err);
            }
            res.json({ success: true });
        }
    );
});

// EXCLUIR EQUIPAMENTO
app.delete("/api/equipamentos/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM equipamentos WHERE id=?", [id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});

// LISTAR NOTEBOOKS
app.get("/api/notebooks", (req, res) => {
  db.query("SELECT * FROM notebooks", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// CADASTRAR NOTEBOOK
app.post("/api/notebooks", (req, res) => {
  const { tipo, modelo, numero_serie, patrimonio, status, observacao, antigo_usuario, entregue } = req.body;
  db.query(
    `INSERT INTO notebooks (tipo, modelo, numero_serie, patrimonio, status, observacao, antigo_usuario, entregue) VALUES (?,?,?,?,?,?,?,?)`,
    [tipo, modelo, numero_serie, patrimonio, status, observacao, antigo_usuario, entregue || null],
    (err, result) => {
      if (err) { console.log("Erro ao cadastrar notebook:", err); return res.status(500).json(err); }
      res.json({ id: result.insertId, ...req.body });
    }
  );
});

// EDITAR NOTEBOOK
app.put("/api/notebooks/:id", (req, res) => {
  const { id } = req.params;
  const { tipo, modelo, numero_serie, patrimonio, status, observacao, antigo_usuario, entregue } = req.body;
  db.query(
    `UPDATE notebooks SET tipo=?, modelo=?, numero_serie=?, patrimonio=?, status=?, observacao=?, antigo_usuario=?, entregue=? WHERE id=?`,
    [tipo, modelo, numero_serie, patrimonio, status, observacao, antigo_usuario, entregue || null, id],
    (err) => {
      if (err) { console.log("Erro ao editar notebook:", err); return res.status(500).json(err); }
      res.json({ success: true });
    }
  );
});

// EXCLUIR NOTEBOOK
app.delete("/api/notebooks/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM notebooks WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

// LISTAR PERIFÉRICOS
app.get("/api/perifericos", (req, res) => {
  db.query("SELECT * FROM perifericos", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// CADASTRAR PERIFÉRICO
app.post("/api/perifericos", (req, res) => {
  const { tipo, modelo, numero_serie, solicitante, matricula, observacao } = req.body;
  db.query(
    `INSERT INTO perifericos (tipo, modelo, numero_serie, solicitante, matricula, observacao) VALUES (?,?,?,?,?,?)`,
    [tipo, modelo, numero_serie, solicitante, matricula || null, observacao || null],
    (err, result) => {
      if (err) { console.log("Erro ao cadastrar periférico:", err); return res.status(500).json(err); }
      db.query("SELECT * FROM perifericos WHERE id = ?", [result.insertId], (err2, rows) => {
        if (err2) return res.status(500).json(err2);
        res.json(rows[0]);
      });
    }
  );
});

// EDITAR PERIFÉRICO
app.put("/api/perifericos/:id", (req, res) => {
  const { id } = req.params;
  const { tipo, modelo, numero_serie, solicitante, matricula, observacao } = req.body;
  db.query(
    `UPDATE perifericos SET tipo=?, modelo=?, numero_serie=?, solicitante=?, matricula=?, observacao=? WHERE id=?`,
    [tipo, modelo, numero_serie, solicitante, matricula || null, observacao || null, id],
    (err) => {
      if (err) { console.log("Erro ao editar periférico:", err); return res.status(500).json(err); }
      db.query("SELECT * FROM perifericos WHERE id = ?", [id], (err2, rows) => {
        if (err2) return res.status(500).json(err2);
        res.json(rows[0]);
      });
    }
  );
});

// EXCLUIR PERIFÉRICO
app.delete("/api/perifericos/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM perifericos WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

// LISTAR USUÁRIOS
app.get("/api/usuarios", (req, res) => {
  db.query("SELECT id, nome, email, nivel, criado_em, primeiro_acesso FROM usuarios ORDER BY email", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// CRIAR USUÁRIO
app.post("/api/usuarios", (req, res) => {
  const { nome, email, senha, nivel } = req.body;
  db.query(
    "INSERT INTO usuarios (nome, email, senha, nivel, primeiro_acesso) VALUES (?,?,?,?,?)",
    [nome, email, senha, nivel || 'usuario', 1],
    (err, result) => {
      if (err) { console.log("Erro ao criar usuário:", err); return res.status(500).json(err); }
      db.query("SELECT id, nome, email, nivel, criado_em, primeiro_acesso FROM usuarios WHERE id = ?", [result.insertId], (err2, rows) => {
        if (err2) return res.status(500).json(err2);
        res.json(rows[0]);
      });
    }
  );
});

// EDITAR USUÁRIO
app.put("/api/usuarios/:id", (req, res) => {
  const { id } = req.params;
  const { nome, email, senha, nivel } = req.body;
  let sql = "UPDATE usuarios SET nome=?, email=?, nivel=?";
  let params = [nome, email, nivel, id];
  
  if (senha) {
    sql = "UPDATE usuarios SET nome=?, email=?, senha=?, nivel=?";
    params = [nome, email, senha, nivel, id];
  }
  
  sql += " WHERE id=?";
  
  db.query(sql, params, (err) => {
    if (err) { console.log("Erro ao editar usuário:", err); return res.status(500).json(err); }
    db.query("SELECT id, nome, email, nivel, criado_em, primeiro_acesso FROM usuarios WHERE id = ?", [id], (err2, rows) => {
      if (err2) return res.status(500).json(err2);
      res.json(rows[0]);
    });
  });
});

// EXCLUIR USUÁRIO
app.delete("/api/usuarios/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM usuarios WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

// TROCAR SENHA NO PRIMEIRO ACESSO
app.put("/api/usuarios/:id/primeira-senha", (req, res) => {
  const { id } = req.params;
  const { novaSenha } = req.body;
  
  if (!novaSenha) {
    return res.status(400).json({ success: false, message: "Nova senha é obrigatória" });
  }
  
  db.query(
    "UPDATE usuarios SET senha=?, primeiro_acesso=? WHERE id=?",
    [novaSenha, 0, id],
    (err) => {
      if (err) { console.log("Erro ao trocar senha:", err); return res.status(500).json(err); }
      db.query("SELECT id, nome, email, nivel, criado_em, primeiro_acesso FROM usuarios WHERE id = ?", [id], (err2, rows) => {
        if (err2) return res.status(500).json(err2);
        res.json({ success: true, usuario: rows[0] });
      });
    }
  );
});

// LISTAR E-SIMS
app.get("/api/esims", (req, res) => {
  db.query("SELECT * FROM esims", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// CADASTRAR E-SIM
app.post("/api/esims", (req, res) => {
  const { numero, nome, matricula, ativo, internacional, internacional_inicio, internacional_fim } = req.body;
  db.query(
    `INSERT INTO esims (numero, nome, matricula, ativo, internacional, internacional_inicio, internacional_fim) VALUES (?,?,?,?,?,?,?)`,
    [
      numero,
      nome,
      matricula || null,
      ativo ? 1 : 0,
      internacional ? 1 : 0,
      internacional_inicio || null,
      internacional_fim || null
    ],
    (err, result) => {
      if (err) { console.log("Erro ao cadastrar e-SIM:", err); return res.status(500).json(err); }
      db.query("SELECT * FROM esims WHERE id = ?", [result.insertId], (err2, rows) => {
        if (err2) return res.status(500).json(err2);
        res.json(rows[0]);
      });
    }
  );
});

// EDITAR E-SIM
app.put("/api/esims/:id", (req, res) => {
  const { id } = req.params;
  const { numero, nome, matricula, ativo, internacional, internacional_inicio, internacional_fim } = req.body;
  db.query(
    `UPDATE esims SET numero=?, nome=?, matricula=?, ativo=?, internacional=?, internacional_inicio=?, internacional_fim=? WHERE id=?`,
    [
      numero,
      nome,
      matricula || null,
      ativo ? 1 : 0,
      internacional ? 1 : 0,
      internacional_inicio || null,
      internacional_fim || null,
      id
    ],
    (err) => {
      if (err) { console.log("Erro ao editar e-SIM:", err); return res.status(500).json(err); }
      db.query("SELECT * FROM esims WHERE id = ?", [id], (err2, rows) => {
        if (err2) return res.status(500).json(err2);
        res.json(rows[0]);
      });
    }
  );
});

// EXCLUIR E-SIM
app.delete("/api/esims/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM esims WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor rodando na porta " + (process.env.PORT || 3000));
});