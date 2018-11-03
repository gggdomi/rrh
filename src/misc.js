export const formatError = err => {
  console.error(err)
  return err.message
  /*
  if (err.response) {
    if (err.response.status === 401) {
      if (err.response.data && err.response.data.error)
        return err.response.data.error
      else
        return `Problème d'authentification. Vous allez être redirigé vers l'écran de connexion.`
    }
    return `Une erreur s'est produite : ${(err.response.data &&
      err.response.data.error) ||
      'code ' + err.response.status}`
  }
  return 'Problème de connexion, veuillez réessayer'
  */
}
