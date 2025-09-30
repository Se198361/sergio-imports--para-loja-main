@echo off
echo Configurando repositório remoto e enviando código para o GitHub...
echo.

REM Adicionando repositório remoto
echo Adicionando repositório remoto...
git remote add origin https://github.com/Se198361/sergio-imports--para-loja.git

REM Enviando código para o repositório remoto
echo Enviando código para o repositório remoto...
git push -u origin main

echo.
echo Processo concluído! Verifique se o código foi enviado corretamente.
pause