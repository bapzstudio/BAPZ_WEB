import Image from "next/image";

/**
 * Icône du menu de l'admin, à la place de celle de Payload. Même image que le
 * logo de connexion, inversée en thème clair par `custom.scss`.
 */
export function Icone() {
  return (
    <Image
      src="/images/marque/bapz-planete.png"
      alt="BAPZ Studio"
      width={512}
      height={512}
      className="bapz-admin-logo"
      style={{ width: 32, height: 32 }}
    />
  );
}
