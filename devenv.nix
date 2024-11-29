{pkgs, ...}: {
  # https://devenv.sh/packages/
  packages = with pkgs; [
    hugo
    git
  ];

  processes = {
    hugo.exec = "hugo server -D";
  };

  enterShell = "hugo";

  # https://devenv.sh/tests/
  # enterTest = ''
  #   echo "Running tests"
  #   git --version | grep --color=auto "${pkgs.git.version}"
  # '';

  # See full reference at https://devenv.sh/reference/options/
}
