// Gli ordinamenti della libreria standard (<algorithm>):
//   sort         introsort, O(n log n) anche nel caso peggiore, NON stabile
//   stable_sort  merge sort, O(n log n), stabile (usa memoria in più)
#include <algorithm>
#include <functional>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

struct Studente {
    string nome;
    int voto;
};

//@region confronto
// Il comparatore risponde a "x deve venire prima di y?".
// Va scritto con < (minore stretto), mai con <=.
bool votoPiuAlto(const Studente& x, const Studente& y) {
    return x.voto > y.voto;
}
//@endregion

int main() {
    //@region sort
    vector<int> v = {5, 2, 9, 1, 5, 6};
    sort(v.begin(), v.end());                       // crescente
    sort(v.begin(), v.end(), greater<int>());       // decrescente
    sort(v.begin() + 1, v.begin() + 4);             // solo v[1..3]: [first, last)
    //@endregion
    cout << "v: ";
    for (int x : v) cout << x << ' ';
    cout << '\n';

    //@region stable
    // già in ordine alfabetico; li vogliamo per voto, dal più alto
    vector<Studente> s = {{"Anna", 28}, {"Bruno", 30}, {"Carla", 28},
                          {"Dario", 25}, {"Elena", 30}, {"Fabio", 28}};
    stable_sort(s.begin(), s.end(), votoPiuAlto);
    // a parità di voto l'ordine alfabetico resta: è la stabilità
    //@endregion
    for (const Studente& x : s) cout << x.voto << ' ' << x.nome << '\n';
    return 0;
}
