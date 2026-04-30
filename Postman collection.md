# Postman Collection - Slack PWA API

Copia el siguiente bloque JSON y guárdalo como un archivo llamado `slack_pwa.postman_collection.json`. Luego impórtalo en Postman (`File > Import`).

```json
{
	"info": {
		"_postman_id": "b7261edd-fb9e-417d-ab8a-003a200f07a1",
		"name": "Slack PWA - API Testing",
		"description": "Colección para probar los flujos de Autenticación y Soporte del Backend.",
		"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
	},
	"item": [
		{
			"name": "Auth",
			"item": [
				{
					"name": "Login",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"var jsonData = pm.response.json();",
									"if (jsonData.data && jsonData.data.access_token) {",
									"    pm.environment.set(\"token\", jsonData.data.access_token);",
									"}"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "POST",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"email\": \"usuario@test.com\",\n    \"password\": \"password123\",\n    \"rememberMe\": true\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{baseUrl}}/api/auth/login",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"api",
								"auth",
								"login"
							]
						},
						"description": "Inicia sesión y guarda automáticamente el token en el entorno."
					},
					"response": []
				},
				{
					"name": "Verify Token",
					"request": {
						"method": "GET",
						"header": [
							{
								"key": "Authorization",
								"value": "Bearer {{token}}",
								"type": "text"
							}
						],
						"url": {
							"raw": "{{baseUrl}}/api/auth/verify-token",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"api",
								"auth",
								"verify-token"
							]
						}
					},
					"response": []
				}
			]
		},
		{
			"name": "Support",
			"item": [
				{
					"name": "Send Support (Authenticated)",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Authorization",
								"value": "Bearer {{token}}",
								"type": "text"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"problem\": \"Error al cargar mensajes\",\n    \"description\": \"Cuando entro al canal general, los mensajes tardan mucho en aparecer.\"\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{baseUrl}}/api/support",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"api",
								"support"
							]
						},
						"description": "Envía soporte usando los datos del usuario logueado (vía token)."
					},
					"response": []
				},
				{
					"name": "Send Support (Guest)",
					"request": {
						"method": "POST",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"name\": \"Juan Perez\",\n    \"email\": \"juan@invitado.com\",\n    \"problem\": \"No puedo registrarme\",\n    \"description\": \"El sistema me dice que mi email no es válido pero es correcto.\"\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{baseUrl}}/api/support",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"api",
								"support"
							]
						},
						"description": "Envía soporte desde la pantalla de login/inicio (sin estar logueado)."
					},
					"response": []
				}
			]
		}
	],
	"variable": [
		{
			"key": "baseUrl",
			"value": "http://localhost:3000",
			"type": "string"
		},
		{
			"key": "token",
			"value": "",
			"type": "string"
		}
	]
}
```

---

### Instrucciones de Uso:
1. Crea un archivo `.json` con el contenido de arriba.
2. Impórtalo en Postman.
3. Asegúrate de que las variables `baseUrl` y `token` existan en tu entorno de Postman.
4. La petición de **Login** actualizará automáticamente la variable `token` cuando se ejecute con éxito.
