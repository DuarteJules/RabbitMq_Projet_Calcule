# Projet Calcul RabbitMQ
ABOU JAMRA Mario - CHEIO Thomas - DUARTE Jules -LABEYE Lucas

# Mise en place de RabbitMQ sous Windows

## 1. Installer Erlang

Téléchargez et installez Erlang :  
https://www.erlang.org/downloads

## 2. Installer RabbitMQ

Téléchargez et installez RabbitMQ (prenez le fichier .exe) :  
https://www.rabbitmq.com/install-windows.html

## 3. Activer le plugin management

Ouvrez un terminal **(cmd ou PowerShell en administrateur)** et exécutez :

rabbitmq-plugins enable rabbitmq_management

shell
Copier
Modifier

## 4. Démarrer RabbitMQ

Dans le terminal, lancez :

rabbitmq-server

yaml
Copier
Modifier

*Ou démarrez le service `RabbitMQ` via l’outil « Services » de Windows.*

## 5. Accéder à l’interface web

Ouvrez votre navigateur à l’adresse :  
[http://localhost:15672/](http://localhost:15672/)

Identifiants par défaut :  
- **Utilisateur :** guest  
- **Mot de passe :** guest

