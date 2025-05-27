import express from 'express';

const router = express.Router();

interface ImageUploadResponse {
  content: {
    download_url: string;
  };
}

// Fonction pour valider le format base64
function isValidBase64(str: string): boolean {
  try {
    return Buffer.from(str, 'base64').toString('base64') === str;
  } catch {
    return false;
  }
}

// Fonction pour nettoyer le base64
function cleanBase64(base64String: string): string {
  // Supprimer le préfixe data URL s'il existe
  if (base64String.includes('base64,')) {
    return base64String.split('base64,')[1];
  }
  return base64String;
}

// Route pour créer une issue
router.post('/', async (req, res) => {
  try {
    const { title, body, image, labels, assignees } = req.body;
    const githubIssueToken = process.env.GITHUB_ISSUE_TOKEN;
    const repoOwner = process.env.GITHUB_REPO_OWNER || 'appen-isen';
    const repoName = process.env.GITHUB_REPO_NAME || 'studysen';

    if (!githubIssueToken) {
      res.status(500).json({
        message: 'Internal server error: Github token is not defined'
      });
      return;
    }

    let finalBodyContent = body;

    // Si une image est fournie, on la télécharge d'abord
    if (image) {
      console.log('Image détectée, téléchargement en cours...');
      try {
        // Vérifier si le dossier images existe
        try {
          await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/images`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${githubIssueToken}`,
              Accept: 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28'
            }
          });
        } catch {
          // Créer le dossier images si nécessaire
          await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/images/.gitkeep`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${githubIssueToken}`,
              'Content-Type': 'application/json',
              Accept: 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify({
              message: 'Create images directory',
              content: '',
              branch: 'main'
            })
          });
        }

        // Nettoyer et valider le base64
        const cleanedBase64 = cleanBase64(image);
        if (!isValidBase64(cleanedBase64)) {
          throw new Error("Le contenu de l'image n'est pas un base64 valide");
        }

        const timestamp = Date.now();
        const imageFileName = `issue_image_${timestamp}.jpg`;

        const imageUploadResponse = await fetch(
          `https://api.github.com/repos/${repoOwner}/${repoName}/contents/images/${imageFileName}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${githubIssueToken}`,
              'Content-Type': 'application/json',
              Accept: 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify({
              message: `Upload image for issue: ${title}`,
              content: cleanedBase64,
              branch: 'main'
            })
          }
        );

        if (!imageUploadResponse.ok) {
          const errorData = await imageUploadResponse.text();
          console.error("Erreur lors du téléchargement de l'image:", errorData);
          throw new Error(`Échec du téléchargement de l'image: ${errorData}`);
        }

        const imageData: ImageUploadResponse = await imageUploadResponse.json();
        finalBodyContent += `\n\n![Screenshot](${imageData.content.download_url})`;
      } catch (error) {
        console.error("Erreur lors du traitement de l'image:", error);
        res.status(500).json({
          message: "Erreur lors du traitement de l'image",
          error: error instanceof Error ? error.message : String(error)
        });
        return;
      }
    }

    // Création de l'issue
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        Authorization: `Bearer ${githubIssueToken}`
      },
      body: JSON.stringify({
        title,
        body: finalBodyContent,
        labels,
        assignees
      })
    });

    if (response.status !== 201) {
      const errorData = await response.text();
      console.error("Réponse de l'API GitHub:", errorData);
      res.status(500).json({
        message: 'Internal server error: Unable to create issue',
        status: response.status,
        error: errorData
      });
      return;
    }

    res.status(200).json({ message: 'Issue created successfully' });
  } catch (error) {
    console.error("Erreur lors de la création de l'issue:", error);
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
