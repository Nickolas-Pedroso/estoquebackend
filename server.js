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
    const sql = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";
    db.query(sql, [email, senha], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length > 0) {
            res.json({ success: true, usuario: result[0] });
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

app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor rodando na porta " + (process.env.PORT || 3000));
});