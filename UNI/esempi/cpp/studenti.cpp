// struct con operator< per ordinare e operator<< per stampare;
// un ordinamento diverso si ottiene passando a sort un comparatore.
#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

//@region studente
struct Studente {
    string nome;
    int voto;

    // prima chi ha il voto più alto; a parità di voto, in ordine di nome
    bool operator<(const Studente& altro) const {
        if (voto != altro.voto) return voto > altro.voto;
        return nome < altro.nome;
    }
};

ostream& operator<<(ostream& os, const Studente& s) {
    return os << s.nome << " (" << s.voto << ")";
}
//@endregion

int main() {
    vector<Studente> classe = {{"Marco", 27}, {"Anna", 30}, {"Luca", 27}, {"Bea", 24}};
    sort(classe.begin(), classe.end());         // usa operator<
    for (const Studente& s : classe) cout << s << '\n';

//@region lambda
    // un altro ordine senza toccare la struct: un comparatore "lambda"
    sort(classe.begin(), classe.end(), [](const Studente& a, const Studente& b) {
        return a.nome < b.nome;
    });
//@endregion
    cout << "per nome:";
    for (const Studente& s : classe) cout << ' ' << s.nome;
    cout << '\n';
    return 0;
}
