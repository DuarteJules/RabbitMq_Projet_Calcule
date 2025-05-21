# Projet Calcul RabbitMQ
ABOU JAMRA Mario - CHEIO Thomas - DUARTE Jules -LABEYE Lucas

# Mise en place du projet

## 1. Prérequis

Créez un fichier .env à la racine de votre projet (ou utilisez .env.example) avec les variables suivantes :

```bash
LOGIN=user
PASSWORD=pass
URL=rabbitmq
```

## 2. Démarrer le project avec Docker Compose

Dans un terminal, lancez la commande suivante dans le dossier racine du project (contenant docker-compose.yml) :

```bash
docker compose up -d
```

## 3. Accéder à l’interface web

Ouvrez votre navigateur à l’adresse :
[http://localhost:15672/](http://localhost:15672/)

Identifiants par défaut :
- **Utilisateur :** user
- **Mot de passe :** pass

## 4. Observer les logs

Pour suivre les logs de vos conteneurs en temps réel, vous pouvez utiliser la commande suivante dans un terminal, à lancer dans le dossier contenant votre fichier docker-compose.yml :

### Voir les logs de tous les conteneurs du projet

```bash
docker compose logs -f
```

Cette commande affiche en continu les logs de tous les services du projet, pratique pour avoir une vue d'ensemble.
Voir les logs d'un conteneur spécifique

Chaque service démarre un conteneur avec un nom comme :
- rabbitmq_projet_calcule-rabbitmq-1
- rabbitmq_projet_calcule-producer-1
- rabbitmq_projet_calcule-worker_add-1
- rabbitmq_projet_calcule-worker_div-1
- rabbitmq_projet_calcule-worker_mul-1
- rabbitmq_projet_calcule-worker_sub-1
- rabbitmq_projet_calcule-consumer-1

Pour suivre les logs d’un conteneur en particulier, utilisez la commande :

```bash
docker logs -f <nom_du_conteneur>
```

Exemple pour le conteneur RabbitMQ :

```bash
docker logs -f rabbitmq_projet_calcule-rabbitmq-1
```

Ou pour un worker spécifique (exemple worker_add) :

```bash
docker logs -f rabbitmq_projet_calcule-worker_add-1
```
