"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql2_1 = __importDefault(require("mysql2"));
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// kintamasis kuris rodo ar mes prisijunge prie duomenu bazes
let connected = false;
// si dalis sukuria prisijungima prie duomenu bazes
const con = mysql2_1.default.createConnection({
    host: "localhost",
    user: "root",
    password: "Jurgita1981",
    database: "students"
});
///Prisijungia prie duomenų bazės
// con.connect();
// con.connect( funkcija kuri bus vykdoma po prisijungimo )
con.connect((error) => {
    if (error)
        throw error;
    //Po prisijungimo be klaidos, nustatome jog esame prisijungę prie DB
    connected = true;
    console.log("Prisijungta");
});
//Sukuriame http serverį ir paduodame f-ją kuri bus vykdoma kai ateis užklausa
const server = http_1.default.createServer((req, res) => {
    const url = req.url;
    const method = req.method;
    /*
    //Jei kažkas atėjo į puslapį su GET metodu į url: localhost:2999/students, Galime jam išsiųsti JSON formatu duomenis
    if (url=='/students' && method=='GET'){
        if (connected){
            con.query<Student[]>("SELECT * FROM students ORDER BY name ASC;", (error,result)=>{
                if (error) throw error;
                res.setHeader("Content-Type", "text/JSON; charset=utf-8");
                res.write(JSON.stringify(result));
                res.end();
            });
        }
    }
    */
    //Dalis skirta statiniem failam išvesti
    let filePath = `public${url}`;
    // fs.existsSync("kelias iki failo")  - patikrina ar failas,katalogas, likas egzistuoja, jei taip, tai garažina 'true', jei ne 'false'
    // fs.lstatSync(filePath).isFile()  -patikrina ar tai failas (ne katalogas, nuoroda, įrenginys)
    if (fs_1.default.existsSync(filePath) && fs_1.default.lstatSync(filePath).isFile()) {
        const ext = path_1.default.extname(filePath);
        switch (ext) {
            case ".css":
                res.setHeader("Content-Type", "text/css; charset=utf-8");
                break;
            case ".js":
                res.setHeader("Content-Type", "application/javascript; charset=utf-8");
                break;
            case ".jpg":
            case ".png":
            case ".jpeg":
                res.setHeader("Content-Type", "image/jpg; charset=utf-8");
                break;
        }
        let file = fs_1.default.readFileSync(filePath);
        res.write(file);
        return res.end();
    }
    //Jei kažkas atėjo į puslapį su GET metodu į url: localhost:2999/students, išsiunčiame jam studentų sąrašą HTML formatu
    if (url == '/students' && method == 'GET') {
        if (connected) {
            con.query("SELECT * FROM students ORDER BY name ASC;", (error, result) => {
                if (error)
                    throw error;
                res.setHeader("Content-Type", "text/html; charset=utf-8");
                let rows = "";
                result.forEach((s) => {
                    rows += "<tr>";
                    rows += `<td>${s.name}</td> <td>${s.surname}</td> <td>${s.phone}</td> <td> <a href='/student/${s.id}' class="btn btn-success">Plačiau</a> <a href='/delete/${s.id}' class="btn btn-danger">Ištrinti</a></td>`;
                    rows += "</tr>";
                });
                let template = fs_1.default.readFileSync('templates/students.html').toString();
                template = template.replace('{{ students_table }}', rows);
                res.write(template);
                res.end();
            });
        }
    }
    // funkcija iskvieciame, kai pridejimo lange paspaudziame submit mygtuka
    if (url == '/add' && method == 'POST') {
        if (connected) {
            // susrinkti duomenis
            const reqBody = [];
            req.on('data', (d) => {
                reqBody.push(d);
            });
            req.on('end', () => {
                const reqData = decodeURIComponent(Buffer.concat(reqBody).toString());
                const dd = reqData.split('&');
                console.log(dd);
                // issiskaldysime duomenis i atskirus kintamuosius
                const name = mysql2_1.default.escape(dd[0].split('=')[1]);
                const surname = mysql2_1.default.escape(dd[1].split('=')[1]);
                const phone = mysql2_1.default.escape(dd[2].split('=')[1]);
                const sex = mysql2_1.default.escape(dd[3].split('=')[1]);
                const birthday = mysql2_1.default.escape(dd[4].split('=')[1]);
                const email = mysql2_1.default.escape(dd[5].split('=')[1]);
                const sql = `INSERT INTO students(name, surname, phone, sex, birthday, email) VALUES (${name}, ${surname}, ${phone}, ${sex}, ${birthday}, ${email})`;
                con.query(sql, (error) => {
                    if (error)
                        throw error;
                });
                res.writeHead(302, {
                    'Location': '/students'
                });
                res.end();
            });
        }
    }
    // funkcija, kai ateiname i pridejimo langa
    if (url == '/add' && method == 'GET') {
        if (connected) {
            let template = fs_1.default.readFileSync('templates/add.html').toString();
            res.write(template);
            res.end();
        }
    }
    //Vieno studento atvaizdavimas, kai url = localhost:2999/student/5
    console.log(url === null || url === void 0 ? void 0 : url.split("/"));
    if ((url === null || url === void 0 ? void 0 : url.split("/")[1]) == 'student') {
        //Pasiimame iš url id
        let id = parseInt(url === null || url === void 0 ? void 0 : url.split("/")[2]);
        con.query(`SELECT * FROM students WHERE id=${id};`, (error, result) => {
            if (error)
                throw error;
            let student = result[0];
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            let template = fs_1.default.readFileSync('templates/student.html').toString();
            template = template.replace("{{ name }}", student.name);
            template = template.replace("{{ surname }}", student.surname);
            template = template.replace("{{ phone }}", student.phone != null ? student.phone : '-');
            template = template.replace("{{ sex }}", student.sex != null ? student.sex : '-');
            template = template.replace("{{ email }}", student.email != null ? student.email : '-');
            template = template.replace("{{ birthday }}", student.birthday != null ? student.birthday.toLocaleDateString() : '-');
            res.write(template);
            res.end();
        });
    }
    if ((url === null || url === void 0 ? void 0 : url.split("/")[1]) == 'delete') {
        //Pasiimame iš url id
        let id = parseInt(url === null || url === void 0 ? void 0 : url.split("/")[2]);
        con.query(`DELETE FROM students WHERE id=${id};`, (error, result) => {
            if (error)
                throw error;
            res.writeHead(302, {
                'Location': '/students'
            });
            res.end();
        });
    }
});
//paleidziame serveri
server.listen(2999, 'localhost');
