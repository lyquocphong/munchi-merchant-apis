# Munchi API Server

This repository contains an API server created with NestJS. The server serves as a connection to a third party to provide services to a merchant system.

## Installation

1. Clone the repository: `git clone https://github.com/quochuy278/munchi-merchant-apis`
2. Install the dependencies: `npm install`
3. Copy the `.env.example` file and rename it to `.env`.
   - Linux/Mac: `cp .env.example .env`
   - Windows (Command Prompt): `copy .env.example .env`
   - Windows (PowerShell): `Copy-Item .env.example .env`
4. Configure the necessary environment variables in the `.env` file. You can refer to the provided `.env.example` file for the required variables.

## Usage

1. Start the server: `npm start`
2. The server will be running at `http://localhost:<PORT>`, where `<PORT>` is the specified port in your `.env` file.

## API Endpoints

- To explore the available endpoints and their functionality, you can access the Swagger documentation by navigating to the base URL of your server followed by `/api`. For example, if your server is running on `http://localhost:5000`, you can access the Swagger documentation at `http://localhost:5000/api`. The Swagger documentation provides detailed information about each endpoint, including request/response schemas and available operations.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
