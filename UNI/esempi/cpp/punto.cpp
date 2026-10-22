// Una struct con due campi e un metodo; accesso con il punto e con ->.
#include <cmath>        // sqrt
#include <iostream>
using namespace std;

//@region punto
struct Punto {
    double x, y;                        // campi
    double distanza() const {           // metodo: usa i campi dell'oggetto
        return sqrt(x * x + y * y);
    }
};
//@endregion

int main() {
//@region uso
    Punto p{3, 4};                      // x = 3, y = 4
    cout << p.distanza() << '\n';       // 5
    p.x = 6;                            // accesso con il punto
    cout << p.distanza() << '\n';       // 7.2111
    Punto* q = &p;
    cout << q->y << '\n';               // con un puntatore: q->y vuol dire (*q).y
//@endregion
    return 0;
}
