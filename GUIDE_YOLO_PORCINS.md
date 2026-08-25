# 🐖 GUIDE — Entraîner le modèle YOLO personnalisé AgriCam (porcins + races locales)

Le modèle YOLOv8n de base (COCO) détecte : vaches, moutons, volailles, chevaux, personnes.
**Il ne détecte pas les porcs** ni les races bovines locales spécifiques. Ce guide explique comment
entraîner votre propre modèle avec les photos des fermes pilotes.

## Étape 1 — Collecter le dataset (déjà intégré dans l'app)

Dans **Mon Élevage → Caméras → « Contribuer au dataset »**, ajoutez des photos réelles de vos animaux.
Objectif : **300+ photos par espèce** (angles, distances, éclairages variés, jour/nuit).
Les photos sont stockées dans `/app/backend/dataset/{espece}/` et comptées via
`GET /api/elevage/vision/dataset/stats`.

## Étape 2 — Annoter les images

Utilisez [Roboflow](https://roboflow.com) (gratuit) ou [CVAT](https://cvat.ai) :
1. Créer un projet « Object Detection »
2. Importer les photos du dossier `dataset/`
3. Dessiner un rectangle sur chaque animal + label (`pig`, `cow`, `sheep`, `bird`, `goat`)
4. Exporter au format **YOLOv8** (train/valid/test 70/20/10)

## Étape 3 — Entraîner (Google Colab gratuit avec GPU)

```python
!pip install ultralytics
from ultralytics import YOLO
model = YOLO("yolov8n.pt")
model.train(data="/content/dataset/data.yaml", epochs=100, imgsz=640, batch=16)
# Le meilleur modèle : runs/detect/train/weights/best.pt
```

Métriques cibles : mAP50 > 0.85 par classe. Documenter version/dataset/précision (transparence bailleurs).

## Étape 4 — Installer le modèle dans AgriCam

1. Renommer `best.pt` → `agricam_livestock.pt`
2. Le placer dans `/app/backend/models/agricam_livestock.pt` (ou définir `YOLO_CUSTOM_MODEL` dans backend/.env)
3. Redémarrer le backend → le système charge automatiquement votre modèle à la place de COCO
4. Vérifier via `GET /api/elevage/vision/engine` et `GET /api/elevage/vision/dataset/stats` (`custom_model_installed: true`)

En attendant, les porcins sont détectés par le **secours Gemini Vision** (déjà actif).
