// Una classe vera: dati privati, costruttore con lista di inizializzazione,
// metodi const e operatori ridefiniti (<, == e <<).
#include <algorithm>
#include <iostream>
#include <numeric>      // gcd
#include <vector>
using namespace std;

//@region classe
class Frazione {
    int num, den;       // privati: si cambiano solo dai metodi della classe
public:
    // lista di inizializzazione: num e den nascono già con il valore giusto
    Frazione(int n = 0, int d = 1) : num(n), den(d) {
        if (den < 0) {                  // il segno sta sempre sul numeratore
            num = -num;
            den = -den;
        }
        int g = gcd(num, den);          // riduce ai minimi termini
        if (g > 1) {
            num /= g;
            den /= g;
        }
    }
    int numeratore() const { return num; }      // const: non modifica l'oggetto
    int denominatore() const { return den; }
    double valore() const { return double(num) / den; }

    bool operator<(const Frazione& b) const { return num * b.den < b.num * den; }
    bool operator==(const Frazione& b) const { return num == b.num && den == b.den; }
};

ostream& operator<<(ostream& os, const Frazione& f) {
    return os << f.numeratore() << '/' << f.denominatore();
}
//@endregion

int main() {
    vector<Frazione> v = {Frazione(3, 4), Frazione(1, 2), Frazione(6, -8), Frazione(2, 3), Frazione(5)};
    sort(v.begin(), v.end());           // usa operator<
    for (const Frazione& f : v) cout << f << "  ";
    cout << '\n';
    cout << boolalpha << (Frazione(2, 4) == Frazione(1, 2)) << '\n';
    cout << Frazione(1, 3).valore() << '\n';
    return 0;
}
