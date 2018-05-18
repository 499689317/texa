
class Card
{
public:
	Card(int color, int kind);
	~Card();

	int GetColor();
	int GetKind();
	void SetColor(int color);
	void SetKind(int kind);
	void Print();
private:
	int _color;
	int _kind;
};
