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
```bash
rabbitmq-plugins enable rabbitmq_management
```

## 4. Démarrer RabbitMQ

Dans le terminal, lancez :
```bash
rabbitmq-server
```
*Ou démarrez le service `RabbitMQ` via l’outil « Services » de Windows.*

Il est possible que vous ayez une erreur de ce style lorsque vous venez d'installer RabbitMQ
`2025-05-20 10:38:07.026000+02:00 [notice] <0.45.0> Application rabbitmq_prelaunch exited with reason: {{shutdown,{failed_to_start_child,prelaunch,{dist_port_already_used,25672,"rabbit","Thomas"}}},{rabbit_prelaunch_app,start,[normal,[]]}}`

Il vous suffira de taper la commande suivante qui va se charger de couper le service rabbit qui fonctionne déjà:
```bash
rabbitmq-service stop
```

## 5. Accéder à l’interface web

Ouvrez votre navigateur à l’adresse :  
[http://localhost:15672/](http://localhost:15672/)

Identifiants par défaut :  
- **Utilisateur :** guest  
- **Mot de passe :** guest

