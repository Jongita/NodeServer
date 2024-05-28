
import { Student } from "./models/students";

import mysql from 'mysql2';

import http from 'http';

import fs from 'fs';
import path from "path";

// kintamasis kuris rodo ar mes prisijunge prie duomenu bazes
let connected=false;

// si dalis sukuria prisijungima prie duomenu bazes
const con=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"Jurgita1981",
    database:"students"
});

// prisijungia prie duomenu bazes
// con.connect();
// con.connect(funkcija kuri bus vykdoma po prisijungimo)
con.connect((error:any)=>{
    if (error) throw error;

    // po prisijungimo be klaidos, nustatome jog esame prisijunge prie DB
    connected=true;

    console.log('Prisijungta');

});

        // sukuriame http serveri ir paduodame f-ja kuri bus vykdoma kai ateis uzklausa
    const server=http.createServer((req,res)=>{
        const url=req.url;
        const method=req.method;

        // jei kazkas atejo i puslapi su GET metodu i url: localhost:2999/students, galime jam issiusti JSON formatu
    //     if(url=='/students' && method=='GET'){
    //     if (connected){
    //     con.query<Student[]>("SELECT * FROM students WHERE sex='vyras';", (error, result) => {
    //     if(error) throw error;
    //     res.setHeader("Contect-Type", "text/JSON; charset=utf-8");
    //     res.write(JSON.stringify(result));
    //     res.end();
        
    // });
    //     }
    // }

        // dalis skirta statiniem failam isvesti
        let filePath = `public${url}`;
    
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()){
        console.log(path.extname(filePath));
        const ext=path.extname(filePath);
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
        let file=fs.readFileSync(filePath);
        res.write(file);
        return res.end();
    }





    // jei kazkas atejo i puslapi su GET metodu i url: localhost:2999/students, galime jam issiusti HTML formatu
        if(url=='/students' && method=='GET'){
        if (connected){
        con.query<Student[]>("SELECT * FROM students;", (error, result) => {
        if(error) throw error;
        res.setHeader("Contect-Type", "text/html; charset=utf-8");
        let rows="";
        result.forEach((s)=>{
            rows+="<tr>";
            rows+=`<td>${s.name}</td> <td>${s.surname} </td> <td>${s.phone}</td> <td> <a href='/student/${s.id}' class="btn btn-success">Plačiau</a></td> `;
            rows+="</tr>";

        })
        let template=fs.readFileSync('templates/students.html').toString();
        template=template.replace(`{{students_table}}`, rows);
        res.write(template);
        res.end();
        
    });
        }
    }

})

    //paleidziame serveri
    server.listen(2999, 'localhost');
