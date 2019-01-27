export const formatError = err => {
  if (err.response) {
    if (err.response.status && err.response.status === 401) {
      if (err.response.data && err.response.data.message)
        return err.response.data.message
      else
        return `Problème d'authentification. Vous allez être redirigé vers l'écran de connexion.`
    }
    return (err.response.data && err.response.data.message) || `Une erreur s'est produite : code ${err.response.status || '?'}`
  }
  return 'Problème de connexion, veuillez réessayer'
}
